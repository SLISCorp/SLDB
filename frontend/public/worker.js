// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyC5XSh_xYS0QQcVuYUWhp1Ix-aWaxLxnB8",
    authDomain: "website-4dff2.firebaseapp.com",
    projectId: "website-4dff2",
    storageBucket: "website-4dff2.appspot.com",
    messagingSenderId: "644729555092",
    appId: "1:644729555092:web:da85f4cae9f9ea4b538c81",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});