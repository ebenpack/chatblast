var React = require('react');

var EmojiInput = React.createClass({
    handleClick: function(e) {
        if (this.props.readyState === 1) {
            this.props.setWhisperMenuState(false);
            this.props.setEmojiMenuState(!this.props.emojiMenuActive);
        }
    },
    handleEmojiClick: function(e) {
        if (this.props.readyState === 1) {
            var text = e.target.textContent !== undefined ? e.target.textContent : e.target.innerText;
            var textNode = document.createTextNode(text);
            this.props.addElement(textNode);
            this.props.setEmojiMenuState(false);
        }
    },
    render: function() {
        var foo = [
            "😁", "😂", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😌", "😍", "😏", "😒", "😓", "😔", "😖", "😘", "😚", "😜", "😝", "😞", "😠", "😡", "😢", "😣", "😥", "😨", "😩", "😪", "😫", "😭", "😰", "😱", "😲", "😳", "😵", "😷", "😸", "😹", "😺", "😻", "😼", "😽", "😾", "😿", "🙀", "¯\\_(ツ)_/¯", "( ͡° ͜ʖ ͡°)", "(╯°□°)╯︵ ┻━┻", "ಠ_ಠ"
        ];
        var emojiTable = "";
        if (this.props.emojiMenuActive) {
            emojiTable = (
                <div className="emojitable">
                    {foo.map(function(curr){
                        return (
                            <span key={curr} className="emoji" onClick={this.handleEmojiClick}>{curr}</span>
                        );
                    }, this)}
                </div>
            );
        }
        return (
            <div title={this.props.title} className="emojiinput" >
                <span onClick={this.handleClick}>😃</span>{emojiTable}
            </div>
        );
    }
});

module.exports = EmojiInput;