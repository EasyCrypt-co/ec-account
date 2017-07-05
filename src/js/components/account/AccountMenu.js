/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import {ACCOUNT_URLS} from "../../utils/constants";

export default class AccountMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.url) {
            switch (this.props.url) {
                case ACCOUNT_URLS.ACCOUNT_EMAIL:
                    this.closeOtherDropDowns(1);
                    this.openDropDown(1);
                    break;
                case ACCOUNT_URLS.ACCOUNT_PASSWORD:
                    this.closeOtherDropDowns(1);
                    this.openDropDown(1);
                    break;
                case ACCOUNT_URLS.ADVANCED:
                    this.closeOtherDropDowns(2);
                    this.openDropDown(2);
                    break;
                case ACCOUNT_URLS.ADVANCED_VIEW_KEYS:
                    this.closeOtherDropDowns(2);
                    this.openDropDown(2);
                    break;
                case ACCOUNT_URLS.ADVANCED_IMPORT_KEYS:
                    this.closeOtherDropDowns(2);
                    this.openDropDown(2);
                    break;
                case ACCOUNT_URLS.ACCOUNT_DELETE:
                    this.closeOtherDropDowns(2);
                    this.openDropDown(2);
                    break;
                default:
                    //do nothing
                    break;
            }
        }
    }

    goToPage(e, page) {
        if (e) {
            e.preventDefault();
        }
        this.props.goToPage(page);
    }

    toggleDropDown(number) {
        let selector = ".account-list li ul.list" + number;
        let upArrowSelector = ".drop" + number + "-up-arrow";
        let downArrowSelector = ".drop" + number + "-down-arrow";
        $(selector).slideToggle();
        if ($(selector).hasClass('open')) {
            $(selector).removeClass('open');
            $(upArrowSelector).show();
            $(downArrowSelector).hide();
        } else {
            $(selector).addClass('open');
            $(upArrowSelector).hide();
            $(downArrowSelector).show();
            if (number == 2) {
                this.goToPage(null, ACCOUNT_URLS.ADVANCED);
            }
        }
    }

    closeOtherDropDowns(number) {
        if (number != 0) {
            for (let i = 1; i <= 2; i++) {
                if (i != number) {
                    let selector = ".account-list li ul.list" + i;
                    let upArrowSelector = ".drop" + i + "-up-arrow";
                    let downArrowSelector = ".drop" + i + "-down-arrow";

                    if ($(selector).hasClass('open')) {
                        $(selector).hide();
                        $(selector).removeClass('open');
                        $(upArrowSelector).show();
                        $(downArrowSelector).hide();
                    }
                }
            }
        }
    }

    openDropDown(number) {
        if (number != 0) {
            let selector = ".account-list li ul.list" + number;
            let upArrowSelector = ".drop" + number + "-up-arrow";
            let downArrowSelector = ".drop" + number + "-down-arrow";

            $(selector).show();
            $(selector).addClass('open');
            $(upArrowSelector).hide();
            $(downArrowSelector).show();
        }
    }
    

    render() {
        return (
            <div className="menu_container">
                {/*<div className="menu-icon-container">*/}
                {/*<div className="menu-icon"></div>*/}
                {/*</div>*/}
                <div className="dashboard-section">
                    <div className="account-list">
                        <ul>
                            <li>
                                <span>
                                    <a href="javascript:void(0)" className="droplist drop1"
                                       onClick={() => this.toggleDropDown(1)}>
                                        <img src="/images/my-account.png"/>Account
                                        <i className="drop1-up-arrow fa fa-caret-down menu-right-arrow"
                                           aria-hidden="true"/>
                                        <i className="drop1-down-arrow fa fa-caret-up menu-right-arrow"
                                           style={{display: "none"}} aria-hidden="true"/>
                                    </a>
                                </span>
                                <ul className="inside-list list1">
                                    <li>
                                        <a href="#" onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ACCOUNT_EMAIL)}
                                           className={(this.props.menuEntry == 1) ? "selected" : ""}>
                                            <i className="fa fa-caret-right sub-menu-arrow" aria-hidden="true"/>
                                            <i className="fa fa-exclamation-triangle red" aria-hidden="true"
                                            style={{display: (this.props.errorEmailIdentity ? "inline-block": "none")}}/>
                                            &nbsp;
                                            Email identity
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ACCOUNT_PASSWORD)}
                                           className={(this.props.menuEntry == 2) ? "selected" : ""}>
                                            <i className="fa fa-caret-right sub-menu-arrow" aria-hidden="true"/>&nbsp;
                                            EasyCrypt password
                                        </a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <span>
                                    <a href="javascript:void(0)" className="droplist drop2"
                                       onClick={() => this.toggleDropDown(2)}>
                                        <i className="droplist-icon fa fa-key" aria-hidden="true"/>Advanced
                                        <i className="drop2-up-arrow fa fa-caret-down menu-right-arrow"
                                           aria-hidden="true"/>
                                        <i className="drop2-down-arrow fa fa-caret-up menu-right-arrow"
                                           style={{display: "none"}} aria-hidden="true"/>
                                    </a>
                                </span>
                                <ul className="inside-list list2">
                                    <li>
                                        <a href="#" onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ADVANCED_VIEW_KEYS)}
                                           className={(this.props.menuEntry == 4) ? "selected" : ""}>
                                            <i className="fa fa-caret-right sub-menu-arrow" aria-hidden="true"/>&nbsp;
                                            View / Export keys
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#"
                                           onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ADVANCED_IMPORT_KEYS)}
                                           className={(this.props.menuEntry == 5) ? "selected" : ""}>
                                            <i className="fa fa-caret-right sub-menu-arrow" aria-hidden="true"/>&nbsp;
                                            Import keys
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ACCOUNT_DELETE)}
                                           className={(this.props.menuEntry == 6) ? "selected" : ""}>
                                            <i className="fa fa-caret-right sub-menu-arrow" aria-hidden="true"/>&nbsp;
                                            Delete account
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}
