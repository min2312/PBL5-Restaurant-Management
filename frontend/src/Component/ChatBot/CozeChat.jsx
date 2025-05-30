import { useEffect } from "react";

const CozeChat = () => {
	useEffect(() => {
		const script = document.createElement("script");
		script.src =
			"https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js";
		script.async = true;

		script.onload = () => {
			if (window.CozeWebSDK) {
				new window.CozeWebSDK.WebChatClient({
					config: {
						bot_id: "7500488605043933191",
					},
					componentProps: {
						title: "Coze",
						// Thêm style tùy chỉnh nếu SDK hỗ trợ
						style: {
							position: "fixed",
							bottom: "20px",
							right: "20px",
							zIndex: 9999,
						},
					},
					auth: {
						type: "token",
						token:
							"pat_AkBf59LB0PhnDqxU0gsaVihK3abnSSDHG1GBoFCpwEPIYMUEp7DjtbvjGNWiukPx",
						onRefreshToken: function () {
							return "pat_AkBf59LB0PhnDqxU0gsaVihK3abnSSDHG1GBoFCpwEPIYMUEp7DjtbvjGNWiukPx";
						},
					},
				});

				// Cách 4: Thêm CSS động sau khi SDK load
				const style = document.createElement("style");
				style.innerHTML = `
          /* Target Coze chat widget specifically */
          [data-coze-chat], 
          .coze-chat-widget,
          #coze-chat-container {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 9999 !important;
            pointer-events: auto !important;
          }
          
          /* Đảm bảo không bị che bởi các container khác */
          .sticky-top {
            z-index: 1000 !important;
          }
        `;
				document.head.appendChild(style);
			}
		};

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
			// Cleanup style nếu cần
			const styles = document.querySelectorAll("style");
			styles.forEach((style) => {
				if (style.innerHTML.includes("coze-chat")) {
					document.head.removeChild(style);
				}
			});
		};
	}, []);

	return null;
};

export default CozeChat;
