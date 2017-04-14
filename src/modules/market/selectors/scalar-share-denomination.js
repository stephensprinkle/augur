import store from '../../../store';
import { updateScalarMarketShareDenomination } from '../../market/actions/update-scalar-market-share-denomination';
import { DENOMINATIONS } from '../../market/constants/share-denominations';

export default function () {
  const { scalarMarketsShareDenomination } = store.getState();
  return {
    denominations: DENOMINATIONS,
    markets: scalarMarketsShareDenomination,
    updateSelectedShareDenomination: selectShareDenomination
  };
}

function selectShareDenomination(marketID, denomination) {
  store.dispatch(updateScalarMarketShareDenomination(marketID, denomination));
}
