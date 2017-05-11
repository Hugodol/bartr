import { connect } from 'react-redux'
import AddressSearch from '../components/AddressSearch'
import { addressEntered } from '../actions/AddressSearchActions'

const mapStateToProps = (state) => {
  return {
    AddressSearch: state.AddressSearch
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    doAddressEntered: (address, lat, lng) => {
      dispatch(addressEntered(address, lat, lng))
    }
    // addressEntered: bindActionCreators(addressEntered, dispatch)
  }
};

const AddressSearchWithData = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddressSearch);

export default AddressSearchWithData