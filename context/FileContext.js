import React, { createContext, useState } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [wavFile, setWavFile] = useState(null);
  const [srtFile, setSrtFile] = useState(null);
  const [fileList, setFileList] = useState([]); // ファイルリストを追加

  return (
    <FileContext.Provider value={{ wavFile, setWavFile, srtFile, setSrtFile, fileList, setFileList }}>
      {children}
    </FileContext.Provider>
  );
};
