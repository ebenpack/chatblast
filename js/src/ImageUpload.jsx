var React = require('react');
var Chat = require('./Chat.jsx');
var Actions = require('./Actions');
var ImageUpload = require('./ImageUpload.jsx');

var ImageUpload = React.createClass({
    handleChange: function(e) {
        if (this.props.readyState === 1) {
            var that = this;
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image();
                img.src = e.target.result;
                that.props.addElement(img);
            };
            Array.prototype.forEach.call(e.target.files, function(curr) {
                reader.readAsDataURL(curr);
            });
        }
    },
    render: function() {
        var labelName = 'imageuploadlabel';
        var inputName = 'imageupload';
        var disabled = false;
        if (this.props.readyState === 1) {
        } else {
            disabled = 'disabled';
            labelName += ' disabled';
            inputName += ' disabled';
        }
        return (
            <label className={labelName}><input type="file" disabled={disabled} className={inputName} onChange={this.handleChange} /></label>
        );
    }
});

module.exports = ImageUpload;