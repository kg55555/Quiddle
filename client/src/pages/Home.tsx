import Footer from "components/organisms/footer";
import Header from "components/organisms/header";
import MainBG from "/img/pexels-cottonbro-6333728-lowres.jpg"

function Home() {
  return (
    <>

    <main className="flex flex-col">
      <section className="intro-section flex flex-col items-center h-screen w-full">
        <Header/>
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: "url(" + MainBG + ")" }}
          />

          <div className="absolute inset-0 -z-9 bg-white/80" />

        <div className="flex-1 flex flex-col justify-center items-center md:w-[80%]">
          <div className="flex flex-col md:w-[60%]">          
            <h1 className="text-8xl mb-12">Quiddle</h1>
            <h3 className="text-3xl mb-8">Quiddle me this</h3>

          </div>

          <div className="flex w-full justify-center">
            <div className="submit-button w-fit bg-purple-700 text-white text-2xl rounded-2xl md:px-5 md:py-3 md:ml-4">
              <p>Get Started</p>
            </div>
          </div>


        </div>
      </section>
      <section>

      </section>
      <section>

      </section>
    </main>
    <Footer/>
    </>
  );
}

export default Home;
