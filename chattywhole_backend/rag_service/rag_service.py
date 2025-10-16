import numpy as np
import faiss
from google import genai
from google.genai import types
from langchain_core.documents import Document
from core.models import RagChunk


class RAGIndex:
    def __init__(self):
        self.client = genai.Client()
        self.model_name = "gemini-embedding-001"

        self.faiss_index = None
        self.documents = []

        self.chunk_size = 1000        
        self.chunk_overlap = 200       

        self.load_data()

    def _chunk_text(self, text):
        """Split one long text into overlapping chunks"""
        chunks = []
        for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
            chunk = text[i:i + self.chunk_size]
            if len(chunk.strip()) >= 100:
                chunks.append(chunk)
        return chunks

    def _embed_texts(self, texts):
        """Embed multiple texts using Gemini"""
        try:
            response = self.client.models.embed_content(
                model=self.model_name,
                contents=texts,
                config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY"),
            )
            return [np.array(e.values) for e in response.embeddings]
        except Exception as e:
            raise Exception(f"Embedding failed: {e}")

    def add_document(self, source_name, full_text, metadata=None):
        """Chunk, embed, and store document text into RagChunk table"""
        try:
            chunks = self._chunk_text(full_text)
            if not chunks:
                print("⚠️ No valid chunks extracted from text.")
                return

            embeddings = self._embed_texts(chunks)

            for chunk, emb in zip(chunks, embeddings):
                RagChunk.objects.create(
                    source=source_name,
                    text=chunk,
                    embedding=emb.tolist(),
                    metadata=metadata or {},
                )

            print(f"✅ Added {len(chunks)} chunks from {source_name}")

            self.load_data()

        except Exception as e:
            raise Exception(f"Error adding document: {e}")

    def load_data(self):
        """Load RagChunk data from DB and rebuild FAISS index"""
        try:
            from django.db.utils import OperationalError, ProgrammingError
            chunks = RagChunk.objects.all()
            if not chunks.exists():
                print("⚠️ No RAG chunks found in the database.")
                return

            self.documents = [
                Document(page_content=c.text, metadata=c.metadata) for c in chunks
            ]
            embeddings = [np.array(c.embedding, dtype=np.float32) for c in chunks]

            embedding_dim = len(embeddings[0])
            self.faiss_index = faiss.IndexFlatL2(embedding_dim)
            self.faiss_index.add(np.array(embeddings, dtype=np.float32))

            print(f"✅ RAG index loaded with {len(chunks)} chunks.")
        except (OperationalError, ProgrammingError):
            print("⚠️ Skipping RAG index load — database not ready yet.")
        except Exception as e:
            raise Exception(f"Error loading RAG data: {e}")

    def retrieve_documents(self, query, k=3):
        """Retrieve most relevant chunks for a given query"""
        try:
            if not self.faiss_index:
                print("⚠️ FAISS index not initialized.")
                return []

            query_embedding = self.client.models.embed_content(
                model=self.model_name,
                contents=[query],
                config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY"),
            ).embeddings[0].values

            query_embedding = np.array(query_embedding, dtype=np.float32).reshape(1, -1)

            distances, indices = self.faiss_index.search(query_embedding, k)

            results = []
            for i in indices[0]:
                if 0 <= i < len(self.documents):
                    results.append(self.documents[i].page_content)

            return results

        except Exception as e:
            raise Exception(f"Error retrieving documents: {e}")

    def delete_all_chunks(self):
        """Delete all chunks from the database"""
        try:
            RagChunk.objects.all().delete()
            print("✅ All chunks deleted from the database.")
        except Exception as e:
            raise Exception(f"Error deleting chunks: {e}")

