import React, { useCallback, useEffect, useRef, useState } from "react";
import { COLORS, DEFAULT_THEME, THEME_DATA } from "../constants";
import useOnClickOutside from "../hooks/use-onclick-outside";
import { ChevronIcon, CloseIcon } from "./Icons";
import Options from "./Options";
import SearchInput from "./SearchInput";
import SelectProvider from "./SelectProvider";
import Spinner from "./Spinner";
const Select = ({ options = [], value = null, onChange, onSearchInputChange, placeholder = "Select...", searchInputPlaceholder = "Search...", isMultiple = false, isClearable = false, isSearchable = false, isDisabled = false, loading = false, menuIsOpen = false, noOptionsMessage = "No options found", primaryColor = DEFAULT_THEME, formatGroupLabel = null, formatOptionLabel = null, classNames }) => {
    const [open, setOpen] = useState(menuIsOpen);
    const [list, setList] = useState(options);
    const [inputValue, setInputValue] = useState("");
    const ref = useRef(null);
    const searchBoxRef = useRef(null);
    useEffect(() => {
        const formatItem = (item) => {
            if ("disabled" in item)
                return item;
            return {
                ...item,
                disabled: false
            };
        };
        setList(options.map(item => {
            if ("options" in item) {
                return {
                    label: item.label,
                    options: item.options.map(formatItem)
                };
            }
            else {
                return formatItem(item);
            }
        }));
    }, [options]);
    useEffect(() => {
        if (isSearchable) {
            if (open) {
                searchBoxRef.current?.select();
            }
            else {
                setInputValue("");
            }
        }
    }, [open, isSearchable]);
    const toggle = useCallback(() => {
        if (!isDisabled) {
            setOpen(!open);
        }
    }, [isDisabled, open]);
    const closeDropDown = useCallback(() => {
        if (open)
            setOpen(false);
    }, [open]);
    useOnClickOutside(ref, () => {
        closeDropDown();
    });
    const onPressEnterOrSpace = useCallback((e) => {
        e.preventDefault();
        if ((e.code === "Enter" || e.code === "Space") && !isDisabled) {
            toggle();
        }
    }, [isDisabled, toggle]);
    const handleValueChange = useCallback((selected) => {
        function update() {
            if (!isMultiple && !Array.isArray(value)) {
                closeDropDown();
                onChange(selected);
            }
            if (isMultiple && (Array.isArray(value) || value === null)) {
                onChange(value === null ? [selected] : [...value, selected]);
            }
        }
        if (selected !== value) {
            update();
        }
    }, [closeDropDown, isMultiple, onChange, value]);
    const clearValue = useCallback((e) => {
        e.stopPropagation();
        onChange(null);
    }, [onChange]);
    const removeItem = useCallback((e, item) => {
        if (isMultiple && Array.isArray(value) && value.length) {
            e.stopPropagation();
            const result = value.filter(current => item.value !== current.value);
            onChange(result.length ? result : null);
        }
    }, [isMultiple, onChange, value]);
    const getSelectClass = useCallback(() => {
        let ringColor = THEME_DATA.ring[DEFAULT_THEME];
        if (COLORS.includes(primaryColor)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ringColor = THEME_DATA.ring[primaryColor];
        }
        let borderFocus = THEME_DATA.borderFocus[DEFAULT_THEME];
        if (COLORS.includes(primaryColor)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            borderFocus = THEME_DATA.borderFocus[primaryColor];
        }
        const baseClass = "flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none";
        const defaultClass = `${baseClass} ${isDisabled
            ? "bg-gray-200"
            : `bg-white hover:border-gray-400 ${borderFocus} focus:ring ${ringColor}`}`;
        return classNames && classNames.menuButton
            ? classNames.menuButton({ isDisabled })
            : defaultClass;
    }, [classNames, isDisabled, primaryColor]);
    const getTagItemClass = useCallback(() => {
        const baseClasse = "bg-gray-200 border rounded-sm flex space-x-1";
        const disabledClass = isDisabled ? "border-gray-500 px-1" : "pl-1";
        return classNames && classNames.tagItem
            ? classNames.tagItem({ isDisabled })
            : `${baseClasse} ${disabledClass}`;
    }, [classNames, isDisabled]);
    return (React.createElement(SelectProvider, { otherData: {
            formatGroupLabel,
            formatOptionLabel,
            classNames
        }, value: value, handleValueChange: handleValueChange },
        React.createElement("div", { className: "relative w-full", ref: ref },
            React.createElement("div", { tabIndex: 0, "aria-expanded": open, onKeyDown: onPressEnterOrSpace, onClick: toggle, className: getSelectClass() },
                React.createElement("div", { className: "grow pl-2.5 py-2 pr-2 flex flex-wrap gap-1" }, !isMultiple ? (React.createElement("p", { className: "truncate cursor-default select-none" }, value && !Array.isArray(value) ? value.label : placeholder)) : (React.createElement(React.Fragment, null,
                    value === null && placeholder,
                    Array.isArray(value) &&
                        value.map((item, index) => (React.createElement("div", { className: getTagItemClass(), key: index },
                            React.createElement("p", { className: classNames && classNames.tagItemText
                                    ? classNames.tagItemText
                                    : "text-gray-600 truncate cursor-default select-none" }, item.label),
                            !isDisabled && (React.createElement("div", { onClick: e => removeItem(e, item), className: classNames &&
                                    classNames.tagItemIconContainer
                                    ? classNames.tagItemIconContainer
                                    : "flex items-center px-1 cursor-pointer rounded-r-sm hover:bg-red-200 hover:text-red-600" },
                                React.createElement(CloseIcon, { className: classNames && classNames.tagItemIcon
                                        ? classNames.tagItemIcon
                                        : "w-3 h-3 mt-0.5" }))))))))),
                React.createElement("div", { className: "flex flex-none items-center py-1.5" },
                    loading && (React.createElement("div", { className: "px-1.5" },
                        React.createElement(Spinner, { primaryColor: primaryColor }))),
                    isClearable && !isDisabled && value !== null && (React.createElement("div", { className: "px-1.5 cursor-pointer", onClick: clearValue },
                        React.createElement(CloseIcon, { className: classNames && classNames.closeIcon
                                ? classNames.closeIcon
                                : "w-5 h-5 p-0.5" }))),
                    React.createElement("div", { className: "h-full" },
                        React.createElement("span", { className: "w-px h-full inline-block text-white bg-gray-300 text-opacity-0" })),
                    React.createElement("div", { className: "px-1.5" },
                        React.createElement(ChevronIcon, { className: `transition duration-300 w-6 h-6 p-0.5${open ? " transform rotate-90 text-gray-500" : " text-gray-300"}` })))),
            open && !isDisabled && (React.createElement("div", { tabIndex: -1, className: classNames && classNames.menu
                    ? classNames.menu
                    : "absolute z-10 w-full bg-white shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700" },
                isSearchable && (React.createElement(SearchInput, { ref: searchBoxRef, value: inputValue, placeholder: searchInputPlaceholder, onChange: e => {
                        onSearchInputChange(e);
                        setInputValue(e.target.value);
                    } })),
                React.createElement(Options, { list: list, noOptionsMessage: noOptionsMessage, text: inputValue, isMultiple: isMultiple, value: value, primaryColor: primaryColor || DEFAULT_THEME }))))));
};
export default Select;
//# sourceMappingURL=Select.js.map