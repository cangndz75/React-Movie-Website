const mongoose = require('mongoose');

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('DB bağlandı!')
    })
    .catch((ex) => {
        console.log('DB bağlantı hatası: ', ex)
    })