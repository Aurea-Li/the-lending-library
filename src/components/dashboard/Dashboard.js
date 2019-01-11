import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import Navbar from '../layout/Navbar'
import GroupLinks from '../groups/GroupLinks'
import GroupPage from '../groups/GroupPage'
import axios from 'axios'
import { leaveGroup, getGroups } from '../../store/actions/groupActions'

class Dashboard extends Component {

  state = {
    activeGroup: false
  };

  getGroups() {
    console.log('inside getGroups');
    const { uid } = this.props.auth;

    const URL = `https://us-central1-al-capstone.cloudfunctions.net/app/groups?uid=${uid}`;

    axios.get(URL)
    .then(response => {

      console.log('response.data is', response.data);
      this.props.getGroups(response.data)

      this.setState({ activeGroup: response.data[0] });
    })
    .catch(error => {
      console.log('Error in Dashboard getting groups', error.message);
    });
  }

  componentDidMount() {
    this.getGroups();
  }

  // componentDidUpdate(prevProps, prevState) {
  //
  //   if (prevState.activeGroup !== this.state.activeGroup && this.state.activeGroup === false){
  //     console.log('inside componentdidupdate');
  //     this.getGroups();
  //   }
  // }

  selectGroup = (group) => {

    this.setState({
      activeGroup: group
    });
  }

  leaveGroup = (group) => {
    console.log('inside leaveGroup');
    this.props.leaveGroup(group);

    this.setState({
      activeGroup: false
    });

  }

  render () {

    console.log('inside render');
    const { activeGroup } = this.state;
    const { auth, groups } = this.props;


    if (!auth.uid) { return <Redirect to='/frontpage' /> }

      if (!activeGroup){
        return (
          <div>
            <p>Loading...</p>
          </div>
        )
      } else {

        return (
          <div>
            <Navbar />
            This is the Dashboard.
            <GroupLinks
              groups={groups}
              selectGroup={(group) => this.selectGroup(group)} />
            { activeGroup ? <GroupPage
              group={activeGroup}
              leaveGroup={() => this.leaveGroup(activeGroup)} /> : null }
          </div>
        )
      }

    }
  }

const mapStateToProps = (state) => {
  console.log('inside mapStatetoprops in Dashboard', state);
  return {
    auth: state.firebase.auth,
    groups: state.group.groups
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    leaveGroup: (group) => dispatch(leaveGroup(group)),
    getGroups: (groups) => dispatch(getGroups(groups))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
