const app = require('./app');
const ipAddr = '127.0.0.1';

app.listen(process.env.PORT, ipAddr, () => {
  console.log(`Server is running on http://${ipAddr}:${process.env.PORT}`);
});
