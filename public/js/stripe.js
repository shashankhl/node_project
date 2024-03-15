import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  // const stripe = Stripe(
  //   'pk_test_51NP3P8IQh6fXwGvitoukOXZvmxXOzbBRpfJKWPUtfw4WCEvpAw6ecxzJW4Drpb36Qel6TQgumK2Scf47vYPsFvth00TtCWIKbj'
  // );
  try {
    // 1) Get v=checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout from + change credit card
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
    // not working check

    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
