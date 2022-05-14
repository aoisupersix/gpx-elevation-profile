import * as React from 'react'
import './../assets/scss/App.scss'
import { GpxUploader } from './GpxUploader'

const reactLogo = require('./../assets/img/react_logo.svg')

const App = () => (
    <div className="app">
        <h1>Hello World!</h1>
        <p>Foo to the barz</p>
        <img src={reactLogo.default} height="480" />
        <GpxUploader />
    </div>
)

export default App
