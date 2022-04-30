import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { Layout, Image, Slider, InputNumber } from 'antd';
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
  return base64url.split(",", 2)[1].replace("/", "_")
}

function App() {
  const imageURL = "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png";
  let [resize, setResize] = useState({
    width: 1000,
    height: 1000,
  });
  let [sigma, setSigma] = useState(1.0);
  let [brightness, setBrightness] = useState(1.0);
  let [contrast, setContrast] = useState(1.0);
  let [gamma, setGamma] = useState(1.0);
  let [url, setURL] = useState(imageURL);

  let generateURL = useCallback(async () => {
    let specs = new proto.abi.Specs();
    specs.addSpecs(newResize(resize));
    specs.addSpecs(newBrightness(brightness));
    specs.addSpecs(newContrast(contrast));
    specs.addSpecs(newGamma(gamma));
    specs.addSpecs(newBlur(sigma));
    let base64 = await base64_arraybuffer(specs.serializeBinary());
    return `http://localhost:8080/image/${base64}/${imageURL}`;
  }, [sigma, resize, brightness, contrast, gamma]);

  useEffect(() => {
    let t = setTimeout(async () => {
      let newURL = await generateURL();
      setURL(newURL);
      console.log(`set url to ${newURL}`);
    }, 500);
    return () => clearTimeout(t);
  }, [sigma, resize, brightness, contrast, gamma, generateURL])


  function newBlur(sigma) {
    let blur = new proto.abi.Blur();
    let spec = new proto.abi.Spec();
    blur.setSigma(sigma)
    spec.setBlur(blur);
    return spec;
  }
  function newBrightness(brightness) {
    let b = new proto.abi.Brightness();
    let spec = new proto.abi.Spec();
    b.setBrightness(brightness);
    spec.setBrightness(b);
    return spec;
  }
  function newContrast(contrast) {
    let c = new proto.abi.Contrast();
    let spec = new proto.abi.Spec();
    c.setContrast(contrast);
    spec.setContrast(c);
    return spec;
  }
  function newGamma(gamma) {
    let g = new proto.abi.Gamma();
    let spec = new proto.abi.Spec();
    g.setGamma(gamma);
    spec.setGamma(g);
    return spec;
  }
  function newResize({width, height}) {
    let resize = new proto.abi.Resize();
    let spec = new proto.abi.Spec();
    resize.setWidth(width);
    resize.setHeight(height);
    spec.setResize(resize);
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
              <label>Width</label>
              <InputNumber addonAfter="px" onChange={w => {
                setResize(r => ({
                  width: w,
                  height: r.height,
                }));
              }}/>
              <label>Height</label>
              <InputNumber addonAfter="px" onChange={h => {
                setResize(r => ({
                  width: r.width,
                  height: h,
                }));
              }}/>
            </div>
            <div>
              <label>Blur</label>
              <Slider min={0} max={100} step={0.1} value={sigma} 
                onChange={setSigma}
              />
            </div>
            <div>
              <label>Brightness</label>
              <Slider min={0} max={100} step={0.1} value={brightness} 
                onChange={setBrightness}
              />
            </div>
            <div>
              <label>Contrast</label>
              <Slider min={0} max={100} step={0.1} value={contrast} 
                onChange={setContrast}
              />
            </div>
            <div>
              <label>Gamma</label>
              <Slider min={0} max={100} step={0.1} value={gamma} 
                onChange={setGamma}
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
      <Footer>Created by Kelo&nbsp;<a target="_blank" rel="noreferrer" href="https://github.com/Kelo007/Thumbor">Github</a></Footer>
    </Layout>
  );
}

export default App;
