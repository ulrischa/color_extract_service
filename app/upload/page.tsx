'use client';

import { useState } from 'react';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please provide a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (url) {
      formData.append('url', url);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      setMessage('File uploaded successfully!');
    } else {
      setMessage('Failed to upload file.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Upload Image</h1>
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="mb-4">
          <input type="file" onChange={handleFileChange} className="p-2 border" />
        </div>
        <div className="mb-4">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter URL (optional)"
            className="p-2 border"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Upload</button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default UploadPage;
