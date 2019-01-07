export const addBook = (book) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    // make async call to database
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const userID = getState().firebase.auth.uid;

    firestore.collection('books').add({
      ...book,
      authorFirstName: profile.firstName,
      authorLastName: profile.lastName,
      userID
    }).then(() => {
      dispatch({ type: 'ADD_BOOK', book });
    }).catch(error => {
      dispatch({ type: 'ADD_BOOK_ERROR', error })
    })
  }
};
