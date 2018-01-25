import {Component, h} from 'preact';

import classNames from 'classnames';

export default class extends Component{
  render(props){
    const {className,...options} = props;
    return (
      <div href="javascript:;" className={classNames('weui-cells',className)} {...options} />
    );
  }
}
