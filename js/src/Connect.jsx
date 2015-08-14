var React = require('react');

var Connect = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    if (this.props.readyState === 0){
        var name = React.findDOMNode(this.refs.name);
        connect(name.value.trim());
        name.value = '';
    }
  },
  render: function() {
    return (
        <div className={this.props.className + ' twelve columns'}>
            <form onSubmit={this.handleSubmit}>
                <input placeholder="Your name" ref="name" />
                <input type="submit" value="Connect" />
            </form>
        </div>
    );
  }
});

module.exports = Connect;