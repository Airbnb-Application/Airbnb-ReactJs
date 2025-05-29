import {redirect} from 'react-router-dom';
import useTokenStore from "../src/hooks/storeToken.js";


export function getTokenDuration() {
    return 60 * 60 * 1000;
}

export function getAuthTokens(accessToken) {
    const token = accessToken;

    if (!token) {
        return null;
    }

    const tokenDuration = getTokenDuration();

    if (tokenDuration < 0) {
        return 'EXPIRED';
    }

    return token;
}