export const encodeFile = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result.toString());
      } else {
        return reject('Failed to get file data');
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
