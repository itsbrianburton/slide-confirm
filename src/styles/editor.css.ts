import { css } from "lit";

export const editorStyles = css`
	:host {
		display: block;
	}

	ha-alert {
		display: block;
		margin-bottom: 16px;
	}

	.section {
		margin: 24px 0 8px;
		font-size: 1rem;
		font-weight: 500;
		color: var(--primary-text-color);
	}

	ha-expansion-panel.slider {
		margin-bottom: 8px;
		--expansion-panel-summary-padding: 0 8px;
	}

	.slider .content {
		padding: 12px;
	}

	.actions {
		display: flex;
		align-items: center;
	}

	.add {
		margin-top: 8px;
	}
`;
