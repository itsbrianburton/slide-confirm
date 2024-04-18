import { css } from "lit";

export const slideConfirmStyles = css`
  .slide-confirm{
    color: var(--text-color);
    border-radius:30px;
    padding:0;
    font-size:.75em;
    position:relative;
    user-select:none;
    -moz-user-select:none;
    -webkit-user-select:none;
    margin: 8px 0;
  }
  
  .slide-confirm-track {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: var(--slider-track-color);
    transition: background-color 500ms;
    opacity: 0.38;
    border-radius: 30px;
  }

  .slide-confirm-text{
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    top: 50%;
    text-align: center;
    transform: translateY(-50%);
    font-size: 1rem;
  }
  .slide-confirm-handle{
    position:relative;
    top:0;
    left:0;
    width:50px;
    height:50px;
    border-radius:25px;
    border: 1px solid var(--switch-unchecked-button-color);
    background-color: var(--switch-unchecked-button-color);
    box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
    box-sizing:border-box;
    text-align:center;
    font-size:20px;
    line-height: 1;
    font-family:serif;
    color: var(--text-color);
    user-select: none;
    touch-action: none;
    transition: transform 300ms;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .slide-confirm-handle.dragging {
    transition: none;
  }
  
  .slide-confirm-handle:hover {
    cursor:-webkit-grab;
    cursor:grab
  }
  .slide-confirm-handle:active {
    cursor:-webkit-grabbing;
    cursor:grabbing
  }

  .slide-confirm.confirmed {
    color: var(--text-color);
  }
  
  .slide-confirm.confirmed .slide-confirm-track {
    background-color: var(--switch-checked-track-color);
    opacity: 0.54;
  }
  
  .slide-confirm.confirmed .slide-confirm-handle {
    border: 1px solid var(--switch-checked-button-color);
    background-color: var(--switch-checked-button-color);
    color: var(--app-header-text-color);
  }
  
  .slide-confirm .unconfirmed {
    display: block;
  }
  
  .slide-confirm .confirmed {
    display: none;
  }
  
  .slide-confirm.confirmed .unconfirmed {
    display: none;
  }
  
  .slide-confirm.confirmed .confirmed {
    display: block;
  }
`;
