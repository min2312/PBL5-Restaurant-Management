import React, { useContext, useState } from "react";
// import { FaUser, FaLock } from "react-icons/fa";
import "../Login/LoginAdmin.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { UserContext } from "../../Context/UserProvider";
import { toast } from "react-toastify";
import { HandleAdminLogin } from "../../services/adminService";

const LoginAdmin = () => {
	const { loginAdmin } = useContext(UserContext);
	let history = useHistory();
	const [formValues, setFormValues] = useState({
		email: "",
		password: "",
	});
	const defaultobjvalidinput = {
		isValidLogin: true,
		isValidPass: true,
	};
	const [objvalidinput, setObjvalidinput] = useState(defaultobjvalidinput);
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};
	const HandleLogin = async (e) => {
		e.preventDefault();
		setObjvalidinput(defaultobjvalidinput);
		if (!formValues.email && !formValues.password) {
			setObjvalidinput({
				...defaultobjvalidinput,
				isValidLogin: false,
				isValidPass: false,
			});
			toast.error("Please fill in your email and password");
			return;
		}
		if (!formValues.email) {
			setObjvalidinput({ ...defaultobjvalidinput, isValidLogin: false });
			toast.error("Please fill in your email");
			return;
		}
		if (!formValues.password) {
			setObjvalidinput({ ...defaultobjvalidinput, isValidPass: false });
			toast.error("Please fill in your password");
		}
		try {
			const response = await HandleAdminLogin(formValues);
			if (response && response.errcode === 0) {
				toast.success("Success Login");
				let userWithRole = { ...response.user, role: "admin" };
				let token = response.DT.access_token;
				let data = {
					isAuthenticated: true,
					token: token,
					id: response.user.id,
					account: userWithRole,
				};
				loginAdmin(data);
				history.push(`/admin`);
			} else {
				toast.error(response.message);
			}
		} catch (e) {
			toast.error("Login failed. Please try again.");
		}
	};

	return (
		<div className="login-page-container">
			<div className="wrapper">
				<h1>Login Admin</h1>
				<div className="input-box">
					<input
						type="email"
						name="email"
						className={
							objvalidinput.isValidLogin
								? "form-control"
								: "is-invalid form-control"
						}
						placeholder="Email"
						value={formValues.email}
						onChange={handleInputChange}
						aria-describedby="emailHelp"
						required
					/>
					<i className="bi bi-person icon"></i>
				</div>
				<div className="input-box">
					<input
						type="password"
						className={
							objvalidinput.isValidPass
								? "form-control"
								: "is-invalid form-control"
						}
						name="password"
						placeholder="Password"
						value={formValues.password}
						onChange={handleInputChange}
						required
					/>
					<i className="bi bi-lock icon"></i>
				</div>
				<button onClick={HandleLogin} type="sumbit">
					Login
				</button>
			</div>
		</div>
	);
};

export default LoginAdmin;
