import * as action from './actionTypes';

export function addressEntered(formatted_address, lat, lng) {
  return {
    type: action.ADDRESS_ENTERED,
    address: formatted_address,
    lat: lat,
    lng: lng
  }
}