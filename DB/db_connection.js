
import mongoose from 'mongoose'


const db_connection = async () => {

  await mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log(`db connected successfully`))
    .catch((err) => console.log(`db connection failed`, err))
}


export default db_connection;
