

  
export default function Main(props){
  return (
    <div>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="flex flex-wrap px-4 sm:px-0"> 
            {props.children}
          </div>
          {/* /End replace */}
        </div>
      </main>
    </div>
  )
}