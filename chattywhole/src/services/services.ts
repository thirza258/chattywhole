import axios from "axios";
import { API_URL } from "../constant";

const postPrompt = async (prompt: string) => {
    const response = await axios.post(`${API_URL}/prompt`, { prompt }, {
        headers: {
            Authorization: localStorage.getItem('apiKey')
        }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Failed to post prompt");
    }
}

const postSummarizer = async (prompt: string) => {
    const response = await axios.post(`${API_URL}/summarizer`, { prompt }, {
        headers: {
            Authorization: localStorage.getItem('apiKey')
        }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Failed to post summarizer");
    }
}

const postTranslator = async (prompt: string, targetLanguage: string, sourceLanguage: string) => {
    const response = await axios.post(`${API_URL}/translator`, { prompt, targetLanguage, sourceLanguage }, {
        headers: {
            Authorization: localStorage.getItem('apiKey')
        }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Failed to post translator");
    }
}

const postWriter = async (prompt: string) => {
    const response = await axios.post(`${API_URL}/writer`, { prompt }, {
        headers: {
            Authorization: localStorage.getItem('apiKey')
        }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Failed to post writer");
    }
}

const postRewriter = async (prompt: string) => {
    const response = await axios.post(`${API_URL}/rewriter`, { prompt }, {
        headers: {
            Authorization: localStorage.getItem('apiKey')
        }
    });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Failed to post rewriter");
    }
}

const services = {
    postPrompt,
    postSummarizer,
    postTranslator,
    postWriter,
    postRewriter,
}

export default services;
