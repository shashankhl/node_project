// console.log('hello from parcel');
import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { signup } from './signup';
import { leaveReview, deleteReview, editReview } from './reviews';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.form--signup');
const reviewDataForm = document.querySelector('.review--form');
const reviews = document.querySelector('.reviews');

// VALUES

// DELEGATION mapbox 🗺

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // extra not necessary as it renders fast 203 Q&A async & await also extra
    document.querySelector('.btn--green').textContent = 'Updating...';

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateSettings(form, 'data');

    // same extra location.reload(); for reloading automatically rather mannual to update changes
    document.querySelector('.btn--green').textContent = 'Save settings';
    location.reload();
    // this like another function can also be implemented in updateSettings to reload

    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings({ name, email }, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    // console.log('😵👀');
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    // const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    signup(name, email, password, confirmPassword);
  });
}

if (reviewDataForm) {
  reviewDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const review = document.getElementById('review').value;
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const { user, tour } = JSON.parse(reviewDataForm.dataset.ids);
    // console.log(tour, user);

    leaveReview(review, rating, tour, user);

    document.getElementById('review').textContent = '';
    document.querySelector('input[name="rating"]:checked').value = '';
  });
}

if (reviews)
  reviews.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const reviewsCard = button.closest('.reviews__card');
      const reviews = reviewsCard.parentNode;
      if (button.textContent === 'Delete') {
        const reviewId = button.dataset.reviewId;
        deleteReview(reviewId);
        setTimeout(() => {
          reviews.removeChild(reviewsCard);
          location.assign('/');
        }, 500);
      } else if (button.textContent === 'Edit') {
        const reviewText = reviewsCard.querySelector('.reviews__text');
        const reviewRatingBox = reviewsCard.querySelector('.reviews__rating');

        /// Cancel button
        let cancel = document.createElement('button');
        cancel.className = 'btn btn--green review__change review__cancel';
        cancel.id = 'review__cancel';
        cancel.textContent = 'Cancel';
        cancel.setAttribute('data-review-text', reviewText.textContent);

        /// Find the rating number
        const stars = reviewsCard.querySelectorAll('.reviews__star--active');

        // InputReview
        const inputReview = document.createElement('textarea');
        inputReview.style.width = '25.8rem';
        inputReview.className = 'reviews__text';
        inputReview.value = reviewText.textContent;

        // InputRating
        const inputRating = document.createElement('input');
        inputRating.className = 'reviews__rating-input';
        inputRating.type = 'number';
        inputRating.value = stars.length;

        reviewsCard.insertBefore(inputReview, reviewText);
        reviewsCard.insertBefore(inputRating, reviewRatingBox);
        reviewsCard.append(cancel);

        reviewsCard.removeChild(reviewText);
        button.textContent = 'Save';
        button.setAttribute('data-review-id', button.dataset.reviewId);
      } else if (button.textContent === 'Cancel') {
        const cancelBtn = reviewsCard.querySelector('.review__cancel');
        const editBtn = reviewsCard.querySelector('.review__edit');
        const reviewTextContent = cancelBtn.dataset.reviewText;
        const inputReview = reviewsCard.querySelector('.reviews__text');
        const inputRating = reviewsCard.querySelector('.reviews__rating-input');

        const reviewText = document.createElement('p');
        reviewText.className = 'reviews__text';
        reviewText.textContent = reviewTextContent;

        reviewsCard.insertBefore(reviewText, inputReview);

        reviewsCard.removeChild(inputReview);
        reviewsCard.removeChild(inputRating);

        reviewsCard.removeChild(cancelBtn);
        editBtn.textContent = 'Edit';
      } else if (button.textContent === 'Save') {
        const inputReview = reviewsCard.querySelector('.reviews__text');
        const inputRating = reviewsCard.querySelector('.reviews__rating-input');
        const cancelBtn = reviewsCard.querySelector('.review__cancel');
        reviewsCard.removeChild(cancelBtn);

        const reviewText = document.createElement('p');
        reviewText.className = 'reviews__text';
        reviewText.textContent = inputReview.value;
        reviewsCard.insertBefore(reviewText, inputReview);

        reviewsCard.removeChild(inputReview);
        reviewsCard.removeChild(inputRating);

        editReview(
          +inputRating.value,
          reviewText.textContent,
          button.dataset.reviewId
        );

        button.textContent = 'Edit';
      }
    }
  });
