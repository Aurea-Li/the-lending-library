export const getRequests = requests => ({
  type: 'GET_REQUESTS',
  requests
})


export const addRequest = (result) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firestore = getFirestore();
    const userID = getState().firebase.auth.uid;
    ;

    const request = {
      title: result.title,
      authors: result.authors,
      img: result.imageLinks.smallThumbnail,
    createdAt: new Date()
    }


    firestore.collection('requests').add({
      ...request,
      userID
    }).then(() => {
      dispatch({ type: 'ADD_REQUEST_NEW', request });
    }).catch(error => {
      dispatch({ type: 'ADD_REQUEST_ERROR', error })
    });
  }
};

export const removeRequest = (request) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {

    const firestore = getFirestore();

    firestore.collection('requests').doc(request.id).delete()
    .then(() => {
      dispatch({ type: 'REMOVE_REQUEST', request });
    }).catch(error => {
      dispatch({ type: 'REMOVE_REQUEST_ERROR', error })
    })
  }
};

export const requestExistingBook = (book) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {


    const firestore = getFirestore();
    const userID = getState().firebase.auth.uid;
    const profile = getState().firebase.profile;


    const { title, authors, img } = book;

    const request = {
      title,
      authors,
      img,
      userID,
      createdAt: new Date()
    }

    const requestInfo = {
      request,
      user: profile
    }

    const requestQuery = firestore.collection('requests').where("title", "==", title).where("userID", "==", userID);
    let requestExists = false;

    requestQuery.get().then(querySnapshot => {

      if (querySnapshot.docs.length > 1){
        requestExists = true;
      }

      if (requestExists === true){
        debugger;
        const error = { message: `Request for ${title} already exists` };
        dispatch({ type: 'ADD_REQUEST_ERROR', error });
      }

      else {
        firestore.collection('requests').add(request).then(() => {
          dispatch({ type: 'ADD_REQUEST_EXISTING', request: requestInfo });
        })
        .catch(error => {
          dispatch({ type: 'ADD_REQUEST_ERROR', error });
        })
      }

    })
    .catch(error => {
      dispatch({ type: 'ADD_REQUEST_ERROR', error });
    });

  }
};

export const fulfillRequest = (request) => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {

    const firestore = getFirestore();
    const profile = getState().firebase.profile;


    const bookPromises = [];
    profile.books.forEach(bookID => {
      bookPromises.push(
        firestore.collection('books').doc(`${bookID}`).get()
      );
    })


    Promise.all(bookPromises).then(querySnapshot => {

      let foundBook = false;
      querySnapshot.forEach(query => {
        const book = query.data();
        const bookID = query.id;

        if (book.title === request.title
          && book.authors.join('') === request.authors.join('')
          && book.status === 'Available'){

            foundBook = true;
            firestore.collection('users').doc(`${request.userID}`).get().then(query => {

              const requestUser = query.data();

              const promises = [
                firestore.collection('books').doc(`${bookID}`).update({
                  borrowerID: request.userID,
                  borrowedDate: new Date(),
                  borrowerFirstName: requestUser.firstName,
                  borrowerLastName: requestUser.lastName,
                  status: 'Unavailable'
                }),
                firestore.collection('requests').doc(`${request.id}`).delete()
              ];

              Promise.all(promises).then(querySnapshot => {

                firestore.collection('books').doc(`${bookID}`).get().then((updatedBook) => {

                  const book = updatedBook.data();
                  book.id = updatedBook.id;

                  dispatch({ type: 'REQUEST_FULFILLED', book })
                  dispatch({ type: 'REMOVE_REQUEST', request })
                })

              })
              .catch(error => {
                dispatch({ type: 'REQUEST_FULFILLED_ERROR', error })
              })

            })
          }
        })

          if (!foundBook){
            const error = {
              message: 'Book not available in library'
            }
            dispatch({ type: 'REQUEST_FULFILLED_ERROR', error })
          }
    })
    .catch(error => {
      dispatch({ type: 'REQUEST_FULFILLED_ERROR', error })
    })
  }
}
