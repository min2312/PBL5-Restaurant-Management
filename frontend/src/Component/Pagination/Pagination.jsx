import React from "react";
import { Pagination as BSPagination } from "react-bootstrap";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	// Generate page items
	const getPageItems = () => {
		const items = [];
		const maxVisiblePages = 5; // Maximum number of page buttons to show

		// Always show first page
		items.push(
			<BSPagination.Item
				key={1}
				active={currentPage === 1}
				onClick={() => onPageChange(1)}
			>
				1
			</BSPagination.Item>
		);

		// Calculate start and end page
		let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

		// Adjust startPage if we're near the end
		if (endPage === totalPages - 1) {
			startPage = Math.max(2, endPage - (maxVisiblePages - 3));
		}

		// Add ellipsis if needed
		if (startPage > 2) {
			items.push(<BSPagination.Ellipsis key="ellipsis-1" disabled />);
		}

		// Add middle pages
		for (let page = startPage; page <= endPage; page++) {
			items.push(
				<BSPagination.Item
					key={page}
					active={currentPage === page}
					onClick={() => onPageChange(page)}
				>
					{page}
				</BSPagination.Item>
			);
		}

		// Add ellipsis if needed
		if (endPage < totalPages - 1) {
			items.push(<BSPagination.Ellipsis key="ellipsis-2" disabled />);
		}

		// Always show last page if there's more than one page
		if (totalPages > 1) {
			items.push(
				<BSPagination.Item
					key={totalPages}
					active={currentPage === totalPages}
					onClick={() => onPageChange(totalPages)}
				>
					{totalPages}
				</BSPagination.Item>
			);
		}

		return items;
	};

	// Don't show pagination if there's only one page
	if (totalPages <= 1) return null;

	return (
		<div className="d-flex justify-content-center my-4">
			<BSPagination>
				<BSPagination.First
					onClick={() => onPageChange(1)}
					disabled={currentPage === 1}
				/>
				<BSPagination.Prev
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				/>

				{getPageItems()}

				<BSPagination.Next
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				/>
				<BSPagination.Last
					onClick={() => onPageChange(totalPages)}
					disabled={currentPage === totalPages}
				/>
			</BSPagination>
		</div>
	);
};

export default Pagination;
