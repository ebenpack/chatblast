var React = require('react');
var Actions = require('./Actions');

var Connect = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    if (this.props.readyState === 0) {
      var name = React.findDOMNode(this.refs.name);
      Actions.connect(name.value.trim());
      name.value = '';
    }
  },
  render: function() {
    return (
      <div className={this.props.className}>
            <form onSubmit={this.handleSubmit}>
                <input placeholder="Your name" ref="name" />
                <input type="submit" value="Connect" />
            </form>
        </div>
    );
  }
});

module.exports = Connect;