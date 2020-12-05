import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://react-my-burger-ac4e5-default-rtdb.firebaseio.com/'
})

export default instance