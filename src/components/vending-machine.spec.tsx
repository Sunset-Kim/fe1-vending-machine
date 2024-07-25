import { fireEvent, render, screen } from "@testing-library/react";
import { VendingMachine } from "./vending-machine";

describe("VendingMachine", () => {
  it("자판기 컴포넌트가 렌더링되고 초기 상태를 보여준다.", () => {
    render(<VendingMachine />);

    expect(screen.getByPlaceholderText("금액 입력")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /투입/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /반환/i })).toBeInTheDocument();

    expect(screen.getAllByTestId("product")).toHaveLength(9);
    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByTestId("logs")).toBeInTheDocument();
  });

  it("자판기 인풋에 음수가 입력되면, 음수를 제외한 숫자만 입력받는다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "-1000" } });

    expect(input.value).toBe("1000");
  });

  it("자판기에 0원을 투입하면 투입처리가 되지 않는다", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });

    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.click(insertButton);

    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByTestId("logs")).not.toHaveTextContent(
      "0원을 넣었습니다."
    );
  });

  it("자판기 컴포넌트가 금액을 입력받고 상태를 업데이트한다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });

    fireEvent.change(input, { target: { value: "1000" } });
    fireEvent.click(insertButton);

    expect(screen.getByTestId("display")).toHaveTextContent("1,000");
    expect(screen.getByTestId("logs")).toHaveTextContent(
      "1,000원을 넣었습니다."
    );
  });

  it("자판기 컴포넌트가 금액을 반환하고 상태를 업데이트한다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });
    const returnButton = screen.getByRole("button", { name: /반환/i });

    fireEvent.change(input, { target: { value: "1000" } });
    fireEvent.click(insertButton);
    fireEvent.click(returnButton);

    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByTestId("logs")).toHaveTextContent(
      "잔돈 1,000원을 반환합니다."
    );
  });

  it("자판기 컴포넌트가 상품을 구매하고 상태를 업데이트한다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });

    fireEvent.change(input, { target: { value: "1000" } });
    fireEvent.click(insertButton);

    const itemButton = screen.getAllByTestId("product")[0] as HTMLButtonElement;
    const price = parseInt(itemButton.dataset.price!, 10);

    fireEvent.click(itemButton);

    expect(screen.getByTestId("display")).toHaveTextContent(`${1000 - price}`);
    expect(screen.getByTestId("logs")).toHaveTextContent(
      `FE${price}를 구매하였습니다.`
    );
  });

  it("상품을 구매하고 잔돈이 0원이 남는 경우 log를 출력하지 않는다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });

    const itemButton = screen.getAllByTestId("product")[0] as HTMLButtonElement;
    const price = parseInt(itemButton.dataset.price!, 10);

    fireEvent.change(input, { target: { value: price.toString() } });
    fireEvent.click(insertButton);
    fireEvent.click(itemButton);

    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByTestId("logs")).not.toHaveTextContent(
      `잔돈 0원을 반환합니다.`
    );
  });

  it("자판기 컴포넌트가 금액이 부족할 때 상품을 구매하지 않고, 아무것도 하지 않는다.", () => {
    render(<VendingMachine />);

    const itemButton = screen.getAllByTestId("product")[0] as HTMLButtonElement;
    const price = parseInt(itemButton.dataset.price!, 10);

    fireEvent.click(itemButton);

    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByTestId("logs")).not.toHaveTextContent(
      `FE${price}를 구매했습니다.`
    );
  });

  it("자판기 컴포넌트가 상품을 구매하고, 최소 상품 금액보다 작으면 금액을 반환한다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });

    fireEvent.change(input, { target: { value: "500" } });
    fireEvent.click(insertButton);

    const itemButton = screen.getAllByTestId("product")[0] as HTMLButtonElement;

    fireEvent.click(itemButton);

    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByTestId("logs")).toHaveTextContent(
      `잔돈 200원을 반환합니다.`
    );
  });

  it("자판기 컴포넌트가 상품을 구매하고, 나머지 금액이 없다면 아무것도 하지 않는다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });

    fireEvent.change(input, { target: { value: "1000" } });
    fireEvent.click(insertButton);

    const itemButton = screen.getAllByTestId("product")[0] as HTMLButtonElement;
    const price = parseInt(itemButton.dataset.price!, 10);

    fireEvent.click(itemButton);
    fireEvent.click(itemButton); // 두 번 클릭하여 잔액이 0 이하로 되는 경우

    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByTestId("logs")).not.toHaveTextContent(
      `FE${price}를 구매했습니다.`
    );
  });

  it("상품 버튼을 눌렀을 때 투입된 금액이 상품 가격보다 적으면 버튼을 누르는 동안 금액 표시창에 상품의 가격이 표시되고, 버튼을 놓으면 투입된 금액이 표시된다.", () => {
    render(<VendingMachine />);

    const input = screen.getByPlaceholderText("금액 입력") as HTMLInputElement;
    const insertButton = screen.getByRole("button", { name: /투입/i });

    fireEvent.change(input, { target: { value: "200" } });
    fireEvent.click(insertButton);

    const itemButton = screen.getAllByTestId("product")[0] as HTMLButtonElement;
    const price = parseInt(itemButton.dataset.price!, 10);

    fireEvent.mouseDown(itemButton);
    expect(screen.getByTestId("display")).toHaveTextContent(`${price}`);

    fireEvent.mouseUp(itemButton);
    expect(screen.getByTestId("display")).toHaveTextContent("200");
  });
});
