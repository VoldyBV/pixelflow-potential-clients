import Client from "./client-api"
import Template from './template-api'
const LOGIN_END_POINT = `https://eu-central-1.aws.realm.mongodb.com/api/client/v2.0/app/data-ukvgc/auth/providers/local-userpass/login`

const logIn = async () => {
    try {
        var response = await fetch(LOGIN_END_POINT, { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'username': process.env.REACT_APP_USER_EMAIL,
              'password': process.env.REACT_APP_USER_PASSWORD
            })
        });
        const key = (await response.json() as any).access_token;
        sessionStorage.setItem("key", key)
    } catch (error) {
        console.error(error);
    }
}
export default {
    logIn,
    Client,
    Template
}