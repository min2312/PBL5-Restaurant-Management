import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import "./ResetPassword.css";
import {
	LogOutUser,
	resetPassword,
	sendResetOTP,
	verifyOTP,
} from "../../services/userService";
import { UserContext } from "../../Context/UserProvider";

const ResetPassword = () => {
	const [step, setStep] = useState(() => {
		const storedStep = localStorage.getItem("resetStep");
		return storedStep ? parseInt(storedStep, 10) : 1;
	});
	const [email, setEmail] = useState(() => {
		const storedEmail = localStorage.getItem("resetEmail");
		return storedEmail ? storedEmail : "";
	});
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [clearingState, setClearingState] = useState(false); // New flag
	const history = useHistory();
	const { logoutContext } = useContext(UserContext);
	// Save only email and current step to localStorage when these values change.
	useEffect(() => {
		if (!clearingState) {
			if (email !== "" || step !== 1) {
				localStorage.setItem("resetEmail", email);
				localStorage.setItem("resetStep", step);
			} else {
				localStorage.removeItem("resetEmail");
				localStorage.removeItem("resetStep");
			}
		}
	}, [email, step, clearingState]);

	const handleRequestOTP = async (e) => {
		e.preventDefault();
		if (!email) {
			toast.error("Please enter your email");
			return;
		}
		setLoading(true);
		try {
			const response = await sendResetOTP(email);
			if (response && response.errCode === 0) {
				setStep(2);
				toast.success("OTP sent to your email");
			} else {
				toast.error(response.errMessage || "Failed to send OTP");
			}
		} catch (error) {
			toast.error("Error sending OTP. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = async (e) => {
		e.preventDefault();
		if (!otp) {
			toast.error("Please enter the OTP");
			return;
		}
		setLoading(true);
		try {
			const response = await verifyOTP(email, otp);
			if (response && response.errCode === 0) {
				setStep(3);
				toast.success("OTP verified successfully");
			} else {
				toast.error(response.errMessage || "Invalid OTP");
			}
		} catch (error) {
			toast.error("Error verifying OTP. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		if (!newPassword || !confirmPassword) {
			toast.error("Please fill all fields");
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		if (newPassword.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}
		setLoading(true);
		try {
			const response = await resetPassword(email, newPassword);
			if (response && response.errCode === 0) {
				setClearingState(true);
				toast.success("Password reset successful");
				localStorage.removeItem("resetEmail");
				localStorage.removeItem("resetStep");
				setEmail("");
				setOtp("");
				setNewPassword("");
				setConfirmPassword("");
				setStep(4);
				setClearingState(false);
				let data = await LogOutUser();
				logoutContext();
			} else {
				toast.error(response.errMessage || "Failed to reset password");
			}
		} catch (error) {
			toast.error("Error resetting password. Please try again.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleBackToLogin = () => {
		localStorage.removeItem("resetEmail");
		localStorage.removeItem("resetStep");
		history.push("/login");
	};

	const handleResendOTP = async () => {
		setLoading(true);
		try {
			const response = await sendResetOTP(email);
			if (response && response.errCode === 0) {
				toast.success("OTP resent to your email");
			} else {
				toast.error(response.errMessage || "Failed to resend OTP");
			}
		} catch (error) {
			toast.error("Error sending OTP. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="reset-password-container">
			<div className="reset-wrapper">
				{step === 1 && (
					<>
						<h1>Reset Password</h1>
						<p className="reset-instruction">
							Enter your email address and we'll send you an OTP to reset your
							password
						</p>
						<form onSubmit={handleRequestOTP}>
							<div className="input-box">
								<input
									type="email"
									placeholder="Email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
								<i className="bi bi-envelope icon"></i>
							</div>
							<button type="submit" disabled={loading}>
								{loading ? "Sending..." : "Send OTP"}
							</button>
						</form>
						<div className="reset-footer">
							<p>
								Remember your password?{" "}
								<span className="link" onClick={handleBackToLogin}>
									Login
								</span>
							</p>
						</div>
					</>
				)}

				{step === 2 && (
					<>
						<h1>Verify OTP</h1>
						<p className="reset-instruction">
							Enter the OTP sent to your email address
						</p>
						<form onSubmit={handleVerifyOTP}>
							<div className="input-box">
								<input
									type="text"
									placeholder="Enter OTP"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									required
								/>
								<i className="bi bi-shield-lock icon"></i>
							</div>
							<button type="submit" disabled={loading}>
								{loading ? "Verifying..." : "Verify OTP"}
							</button>
						</form>
						<div className="reset-footer">
							<p>
								Didn't receive the OTP?{" "}
								<span className="link" onClick={handleResendOTP}>
									Resend OTP
								</span>
							</p>
							<p>
								<span className="link" onClick={() => setStep(1)}>
									Back
								</span>
							</p>
						</div>
					</>
				)}

				{step === 3 && (
					<>
						<h1>New Password</h1>
						<p className="reset-instruction">
							Create a new password for your account
						</p>
						<form onSubmit={handleResetPassword}>
							<div className="input-box">
								<input
									type="password"
									placeholder="New Password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
								/>
								<i className="bi bi-lock icon"></i>
							</div>
							<div className="input-box">
								<input
									type="password"
									placeholder="Confirm Password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
								<i className="bi bi-lock-fill icon"></i>
							</div>
							<button type="submit" disabled={loading}>
								{loading ? "Resetting..." : "Reset Password"}
							</button>
						</form>
						<div className="reset-footer">
							<p>
								<span className="link" onClick={() => setStep(2)}>
									Back
								</span>
							</p>
						</div>
					</>
				)}

				{step === 4 && (
					<>
						<div className="success-icon">
							<i className="bi bi-check-circle-fill"></i>
						</div>
						<h1>Success!</h1>
						<p className="reset-instruction">
							Your password has been reset successfully
						</p>
						<button onClick={handleBackToLogin}>Back to Login</button>
					</>
				)}
			</div>
		</div>
	);
};

export default ResetPassword;
