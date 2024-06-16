import React, { createContext, useState } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [wavFile, setWavFile] = useState(null);
  const [srtFile, setSrtFile] = useState(null);

  return (
    <FileContext.Provider value={{ wavFile, setWavFile, srtFile, setSrtFile }}>
      {children}
    </FileContext.Provider>
  );
};
