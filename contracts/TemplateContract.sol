// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TemplateContract is ERC721A, Ownable {
    uint256 public price;
    uint256 public maxMintPerTx;
    uint256 public immutable collectionSize;
    bool public free = false;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _price,
        uint256 _maxMintPerTx,
        uint256 _collectionSize
    ) ERC721A(_name, _symbol) {
        price = _price;
        maxMintPerTx = _maxMintPerTx;
        collectionSize = _collectionSize;
    }

    // Events
    event PriceChanged(uint256 newPrice);

    // ERC721A starts counting tokenIds from 0, this contract starts from 1
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    // Minting & Transfering
    function mint(uint256 _quantity) external payable {
        require(_quantity <= maxMintPerTx, "Quantity is too large"); // Cannot mint more than maxMintPerTx
        require(msg.value >= price, "Sent Ether is too low");

        _safeMint(msg.sender, _quantity);
    }

    function transfer(address _to, uint256 _tokenId) external {
        transferFrom(msg.sender, _to, _tokenId);
    }

    // Utils
    function setFree(bool _value) external onlyOwner {
        require(free != _value, "Already set to this value");
        free = _value;
    }

    function changePrice(uint256 _newPrice) external onlyOwner {
        require(price != _newPrice, "Already set to this value");
        price = _newPrice;

        emit PriceChanged(_newPrice);
    }
}
