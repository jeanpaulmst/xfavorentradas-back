import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

const mpClient = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

const preference = new Preference(mpClient);

export {
    mpClient,
    preference
};
