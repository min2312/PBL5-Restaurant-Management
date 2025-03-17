import { Fragment } from "react";
import "./App.css";
import ClientRoute from "./Routes/ClientRoute";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
	return (
		<Fragment>
			<Router>
				{/* {user && user.isLoading ? (
					<div className="loading-container">
						<Oval
							visible={true}
							height="80"
							width="80"
							color="#4fa94d"
							ariaLabel="oval-loading"
							wrapperStyle={{}}
							wrapperClass=""
						/>
						<div>Loading Data....</div>
					</div>
				) : (
					<>
						<div className="app-header">
							<NavBar />
						</div> */}
				<div className="app-container">
					<ClientRoute />
				</div>
				{/* <div className="app-footer">
							<Footer />
						</div>
					</>
				)} */}
			</Router>
		</Fragment>
	);
}

export default App;
