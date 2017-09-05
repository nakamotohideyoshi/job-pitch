import React, { Component } from 'react';
import Helmet from 'react-helmet';

export default class Terms extends Component {
  render() {
    return (
      <div>
        <Helmet title="Terms & Conditions" />
        <div className="pageHeader">
          <h1>Terms & Conditions</h1>
        </div>
        <div className="board">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean consequat
          tortor fermentum mi fermentum dignissim. Nullam vel ipsum ut ligula elementum
          lobortis. Maecenas aliquam, massa laoreet lacinia pretium, nisi urna venenatis
          tortor, nec imperdiet tellus libero efficitur metus. Fusce semper posuere
          ligula, et facilisis metus bibendum interdum. Mauris at mauris sit amet sem
          pharetra commodo a eu leo. Nam at est non risus cursus maximus. Nam feugiat
          augue libero, id consectetur tortor bibendum non. Quisque nec fringilla lorem.
          Nullam efficitur vulputate mauris, nec maximus leo dignissim id.</p>
          <p>Nullam eu feugiat mi. Quisque nec tristique nisl, dignissim dictum leo. Nam
          non quam nisi. Donec rutrum turpis ac diam blandit, id pulvinar mauris
          suscipit. Pellentesque tincidunt libero ultricies risus iaculis, sit amet
          consequat velit blandit. Fusce quis varius nulla. Nullam nisi nisi, suscipit
          ut magna quis, feugiat porta nibh. Sed id enim lectus. Suspendisse elementum
          justo sapien, sit amet consequat orci accumsan et. Aliquam ornare ullamcorper
          sem sed finibus. Nullam ac lacus pulvinar, egestas felis ut, accumsan est.</p>
          <p>Pellentesque sagittis vehicula sem quis luctus. Proin sodales magna in lorem
          hendrerit aliquam. Integer eu varius orci. Vestibulum ante ipsum primis in
          faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum ante ipsum
          primis in faucibus orci luctus et ultrices posuere cubilia Curae; Ut at mauris
          nibh. Suspendisse maximus ac eros at vestibulum.</p>
          <p>Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque egestas
          tortor et dui consequat faucibus. Nunc vitae odio ornare, venenatis ligula a,
          vulputate nisl. Aenean congue varius ex, sit amet bibendum odio posuere at.
          Nulla facilisi. In finibus, nulla vitae tincidunt ornare, sapien nulla
          fermentum mauris, sed consectetur tortor arcu eget arcu. Vestibulum vel quam
          enim.</p>
        </div>
      </div>
    );
  }
}
