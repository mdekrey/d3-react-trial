import React from 'react';
import './App.css';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';
import { demos } from './demos';

export const App: React.FC = () => {
  return (
    <Switch>
      {demos.map((demo, index) => <Route exact path={`/demo/${index}`} component={demo.Component} key={demo.OriginalUrl} />)}
      <>
        <h1>Demos</h1>
        <ul>
          {demos.map((demo, index) =>
            <React.Fragment key={demo.OriginalUrl}>
              <li>
                <Link to={`/demo/${index}`}>{demo.Name}</Link>
                {" adapted from "}<a href={demo.OriginalUrl}>{demo.OriginalUrl}</a>
              </li>
            </React.Fragment>)}
        </ul>
      </>
    </Switch>
  );
}
