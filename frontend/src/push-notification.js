// import firebase from 'firebase';
// import 'firebase/messaging';

// export const initializeFirebase = () => {
//     //     firebase.initializeApp({
//     //         apiKey: "AIzaSyC5XSh_xYS0QQcVuYUWhp1Ix-aWaxLxnB8",
//     //         authDomain: "website-4dff2.firebaseapp.com",
//     //         projectId: "website-4dff2",
//     //         storageBucket: "website-4dff2.appspot.com",
//     //         messagingSenderId: "644729555092",
//     //         appId: "1:644729555092:web:da85f4cae9f9ea4b538c81",
//     //         measurementId: "G-91V49V5WLB"
//     //     });
//     // }
// }

// firebase.initializeApp({
//     apiKey: "AIzaSyC5XSh_xYS0QQcVuYUWhp1Ix-aWaxLxnB8",
//     authDomain: "website-4dff2.firebaseapp.com",
//     projectId: "website-4dff2",
//     storageBucket: "website-4dff2.appspot.com",
//     messagingSenderId: "644729555092",
//     appId: "1:644729555092:web:da85f4cae9f9ea4b538c81",
//     measurementId: "G-91V49V5WLB"
// });

// const messaging = firebase.messaging();

// export const onMessageListener = () => {
//     return new Promise((resolve, reject) => {
//         messaging.onMessage((payload) => {
//             resolve(payload);
//         });
//     });
// }

// export const askForPermissioToReceiveNotifications = async () => {
//     try {
//         const messaging = firebase.messaging();
//         await messaging.requestPermission();
//         const token = await messaging.getToken();
//         console.log('token do usuário:', token);

//         return token;
//     } catch (error) {
//         console.error(error);
//     }
// }