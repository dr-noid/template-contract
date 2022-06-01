// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TemplateContract is ERC721A, Ownable {
    uint256 public price;
    uint256 public maxMintPerTx;
    uint256 public immutable collectionSize;
    string public baseUri;
    bool public open = false;
    uint256 public maxFree;
    address[] public allowlist;

    mapping(address => bool) public hasMinted;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _price,
        uint256 _maxMintPerTx,
        uint256 _collectionSize,
        uint256 _maxFree
    ) ERC721A(_name, _symbol) {
        price = _price;
        maxMintPerTx = _maxMintPerTx;
        collectionSize = _collectionSize;
        maxFree = _maxFree;
        allowlist.push(owner());
    }

    // Events
    event PriceChanged(uint256 newPrice);
    event MaxMintPerTxChanged(uint256 newMaxMintPerTx);

    // Minting
    function mint(uint256 _quantity) external payable {
        require(open, "Minting has not started yet");
        require(_quantity <= maxMintPerTx, "Quantity is too large");
        require(_quantity > 0, "Must mint at least 1 token");
        require(
            _totalMinted() + _quantity <= collectionSize,
            "Collection is full"
        );

        unchecked {
            if (hasMinted[msg.sender]) {
                require(
                    msg.value >= _quantity * price,
                    "Sent Ether is too low"
                );
                _safeMint(msg.sender, _quantity);
            } else {
                if (_quantity <= maxFree) {
                    _safeMint(msg.sender, _quantity);
                    hasMinted[msg.sender] = true;
                    return;
                }
                if (_quantity > maxFree) {
                    require(msg.value >= (_quantity - maxFree) * price);
                    _safeMint(msg.sender, _quantity);
                    hasMinted[msg.sender] = true;
                    return;
                }
            }
        }
    }

    // TokenURIs
    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    // Utils
    function setPrice(uint256 _newPrice) external onlyOwner {
        require(price != _newPrice, "Already set to this value");
        price = _newPrice;

        emit PriceChanged(_newPrice);
    }

    function setMaxMintPerTx(uint256 _newMaxMintPerTx) external onlyOwner {
        require(maxMintPerTx != _newMaxMintPerTx, "Already set to this value");
        maxMintPerTx = _newMaxMintPerTx;

        emit MaxMintPerTxChanged(_newMaxMintPerTx);
    }

    function setBaseURI(string calldata _newBaseURI) external onlyOwner {
        // We don't bother checking if the URI is already set to this value
        // It's just unnecessary gas usage as the owner can check this manually
        baseUri = _newBaseURI;
    }

    function setOpen(bool _value) external onlyOwner {
        open = _value;
    }

    // Allowlist
    function addToAllowlist(address _address) external onlyOwner {
        allowlist.push(_address);
    }

    function withdrawMoney() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    function allowlistMint(uint256 _quantity) external {
        address[] memory _allowlist = allowlist;
        bool allowed = false;
        unchecked {
            for (uint256 i = 0; i < _allowlist.length; i++) {
                if (_allowlist[i] == msg.sender) {
                    allowed = true;
                    break;
                }
            }
        }
        require(allowed, "You are not allowed to mint");
        require(
            _totalMinted() + _quantity <= collectionSize,
            "Collection is full"
        );
        _safeMint(msg.sender, _quantity);
    }

    // Overrides from ERC721A
    // ERC721A starts counting tokenIds from 0, this contract starts from 1
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    // ERC721A has no file extensions for its tokenURIs
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length != 0
                ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
                : "";
    }
}
