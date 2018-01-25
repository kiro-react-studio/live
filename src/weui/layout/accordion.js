import { Component, h } from 'preact';
import { WeuiCells, WeuiCell, WeuiCellBody, WeuiCellFooter } from 'weui/cells';
import WeuiIcon from 'weui/icon';

import classNames from 'classnames';
import { Events } from 'util';

export default class extends Component {
  static defaultProps = {
    visible: false,
    items: [],
    onClick: Events.defaultOnClick
  };

  get children() {
    let { items, onClick } = this.props;
    let tmp = null;
    if (items.constructor === Object) {
      tmp = items;
      items = Object.keys(tmp);
    }

    return items.map((item, index) => {
      return (
        <WeuiCell access onClick={this._onClick.bind(this, item)}>
          <WeuiCellBody>{item}</WeuiCellBody>
          {tmp ? this.renderItem(tmp[item]) : <WeuiCellFooter />}
        </WeuiCell>
      );
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible
    };
  }

  _onClick = inEvent => {
    const { onClick } = this.props;
    onClick(inEvent);
  };

  _onHdClick = inEvent => {
    this.setState({
      visible: !this.state.visible
    });
    const { onClick } = this.props;
    onClick && onClick(inEvent);
  };

  renderItem = data => {
    return data !== undefined && data.constructor === Boolean ? (
      <WeuiIcon name={`${data ? 'icon-check success' : 'icon-close important'}`} />
    ) : (
      data
    );
  };

  render({ title, desc, icon, items }) {
    return (
      <section
        className={classNames('accordion', {
          js_show: this.state.visible
        })}
      >
        <header
          className="hd weui-flex js_category"
          onClick={this._onHdClick.bind(this, title)}
        >
          <p className="weui-flex__item">{title}</p>
          {desc && (<p className="weui-flex__item__desc">{desc}</p>)}
          {icon !== undefined && icon.constructor === Boolean ? (
            <WeuiIcon name={`${icon && this.state.visible ? 'icon-jiantoushang' : 'icon-jiantouxia'}`} />
          ) : (
            // <img src={`./components/_assets/images/${icon}`} alt="" />
            <WeuiIcon name={icon} />
          )}
        </header>
        <div className="bd page__category js_categoryInner">
          <WeuiCells>{this.children}</WeuiCells>
        </div>
      </section>
    );
  }
}
