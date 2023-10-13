/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51MKpmBEyCGQZkhGqTxygEQIjElgBGBzpqcVz2kjbPteDxODaj3rzqcyTSG1LXeIHpcR7UwE2Ne38OHrYOyJ9kt7V00eTacS8P5',
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:8080/api/v1/booking/checkout-session/${tourId}`,
    );

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
