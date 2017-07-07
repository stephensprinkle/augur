import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const AuthOnBoard = p => (
  <article className="auth-onboard">
    <h1>Link an Ethereum Account to trade on anything from anywhere</h1>
    <div className="auth-onboard-actions">
      <button>Connect Account</button>
      <button>Create Account</button>
      <span>I already have an account with Ethereum currency in it</span>
      <span>I need a new account to trade with Augur</span>
    </div>
  </article>
);

export default AuthOnBoard;
