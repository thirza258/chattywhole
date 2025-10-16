import axios from "axios";
import { API_URL } from "../constant";


const postPrompt = async (prompt: string) => {
  const response = await axios.post(
    `${API_URL}/prompt/`,
    { prompt },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post prompt");
  }
};

const postProofreader = async (prompt: string) => {
  const response = await axios.post(
    `${API_URL}/proofreader/`,
    { prompt },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post proofreader");
  }
};

const postSummarizer = async (prompt: string) => {
  const response = await axios.post(
    `${API_URL}/summarizer/`,
    { prompt },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post summarizer");
  }
};

const postTranslator = async (
  prompt: string,
  targetLanguage: string,
  sourceLanguage: string
) => {
  console.log(prompt, targetLanguage, sourceLanguage);
  const response = await axios.post(
    `${API_URL}/translator/`,
    { 
      prompt,
      target_language: targetLanguage,
      source_language: sourceLanguage 
    },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post translator");
  }
};

const postWriter = async (prompt: string) => {
  const response = await axios.post(
    `${API_URL}/writer/`,
    { prompt },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post writer");
  }
};

const postRewriter = async (prompt: string) => {
  const response = await axios.post(
    `${API_URL}/rewriter/`,
    { prompt },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post rewriter");
  }
};

const postCopywriting = async (prompt: string) => {
  const response = await axios.post(
    `${API_URL}/copywriting/`,
    { prompt },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post copywriting");
  }
};

const postExplainer = async (prompt: string) => {
  const response = await axios.post(
    `${API_URL}/explainer/`,
    { prompt },
    {
      headers: {
        Authorization: localStorage.getItem("apiKey"),
      },
    }
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to post explainer");
  }
};

const getHistory = async () => {
  const response = await axios.get(`${API_URL}/history`, {
    headers: {
      Authorization: localStorage.getItem("apiKey"),
    },
  });
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to get history");
  }
};

const handleResponseData = (response: string) => {
    if (typeof response === 'string' && response.charAt(0) === '{') {
        const parsedData = JSON.parse(response);
        if (parsedData.response) {
            return parsedData.response;
        }
    }
    return response;
}

const insertFile = async (file: File) => {
  const response = await axios.post(`${API_URL}/file/`, { file }, {
    headers: {
      Authorization: localStorage.getItem("apiKey"),
    },
  });
    
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error("Failed to insert file");
  }
}

const chatWithRAG = async (prompt: string) => {
  const response = await axios.post(`${API_URL}/rag/`, { prompt }, {
    headers: {
      Authorization: localStorage.getItem("apiKey"),
    },
  });
  return response.data;
}

const services = {
  postPrompt,
  postProofreader,
  postSummarizer,
  postTranslator,
  postWriter,
  postRewriter,
  postCopywriting,
  postExplainer,
  getHistory,
  chatWithRAG,
  insertFile,
  handleResponseData,
};

export default services;
