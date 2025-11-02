import React from 'react'
import Crausal from '../components/Crausal'
import CartSlider from '../components/CartSlider'
import banner from "../../assets/banner.webp"
import ProductGrid from '../components/ProductGrid'


const Home = () => {
  return (
    <div className=' mt-20'>
      <Crausal />
      <CartSlider />
      <section className='py-10 pt-12 w-full'>
        <div className="w-full ">
          <img src={banner} className='w-full' />
        </div>
      </section>
      <ProductGrid/>
    </div>
  )
}

export default Home