export default function Main(props){
  return (
    <div>
      <main>
        <div className="grid grid-cols-1 px-4 sm:px-0">
          {props.children}
        </div>  
      </main>
    </div>
  )
}