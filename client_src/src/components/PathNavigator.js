import React from 'react';

class PathNavigator extends React.Component {
  render() {
    const path = this.props.path.length ?
      this.props.path.map((step, idx) => <span key={ idx }>\{ step }</span>) :
      <span>\</span>;
    return (
      <div>
        { path }
      </div>
    );
  }
}

export default PathNavigator;
