import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { Layout, Image, Slider } from 'antd';
import './abi_pb'

const { Header, Footer, Content } = Layout;
const proto = window.proto;

const base64_arraybuffer = async (data) => {
  // Use a FileReader to generate a base64 data URI
  const base64url = await new Promise((r) => {
      const reader = new FileReader()
      reader.onload = () => r(reader.result)
      reader.readAsDataURL(new Blob([data]))
  })

  /*
  The result looks like 
  "data:application/octet-stream;base64,<your base64 data>", 
  so we split off the beginning:
  */
  return base64url.split(",", 2)[1]
}

function App() {
  const imageURL = "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png";
  let [sigma, setSigma] = useState(1.0);
  let [url, setURL] = useState(imageURL);

  let generateURL = useCallback(async () => {
    let specs = new proto.abi.Specs();
    specs.addSpecs(newBlur(sigma));
    let base64 = await base64_arraybuffer(specs.serializeBinary());
    return `/image/${base64}/${imageURL}`;
  }, [sigma]);

  useEffect(() => {
    let t = setTimeout(async () => {
      let newURL = await generateURL();
      setURL(newURL);
      console.log(`set url to ${newURL}`);
    }, 500);
    return () => clearTimeout(t);
  }, [sigma, generateURL])


  function newBlur(sigma) {
    let blur = new proto.abi.Blur();
    let spec = new proto.abi.Spec();
    blur.setSigma(sigma)
    spec.setBlur(blur);
    return spec;
  }

  return (
    <Layout>
      <Header>
        <div id="logo"><h1>Thumbor</h1></div>
      </Header>
      <Content>
        <div id="main">
          <div id="operation-board">
            <div>
              <label>Blur</label>
              <Slider min={0} max={100} step={0.1} value={sigma} 
                onChange={setSigma}
              />
            </div>

          </div>
          <div className="divider"></div>
          <div id="image-board">
            <Image
              className="the-image"
              src={url}
            />
          </div>
        </div>
      </Content>
      <Footer>Footer</Footer>
    </Layout>
  );
}

export default App;
