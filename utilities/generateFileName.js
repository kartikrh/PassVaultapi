const generateFileName = () => {
  let timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  let random = ("" + Math.random()).substring(2, 8);
  return timestamp + random;
};
module.exports = {
    generateFileName
}