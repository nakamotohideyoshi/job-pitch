//
//  DownPickerMultiple.m
//  Pods
//
//  Created by user on 27/01/2016.
//
//

#import "DownPickerMultiple.h"

@implementation DownPickerMultiple
{
    NSString* _previousSelectedString;
    NSMutableArray* _selection;
}

-(void)cancelClicked:(id)sender
{
    [textField resignFirstResponder]; //hides the pickerView
    if (_previousSelectedString.length == 0 || ![self->dataArray containsObject:_previousSelectedString]) {
        self->textField.placeholder = self->placeholder;
    }
    self->textField.text = _previousSelectedString;
}

-(void)doneClicked:(id) sender
{
    //hides the pickerView
    [textField resignFirstResponder];
    
    if (self->textField.text.length == 0 || ![self->dataArray containsObject:self->textField.text]) {
        // self->textField.text = [dataArray objectAtIndex:0];
        [self setValueAtIndex:-1];
        self->textField.placeholder = self->placeholder;
    }
    [self updateTextField];
    [self sendActionsForControlEvents:UIControlEventValueChanged];
}

- (void)updateTextField
{
    NSMutableArray *selections = [[NSMutableArray alloc] init];
    for (NSString *selection in dataArray) {
        if ([_selection containsObject:selection])
            [selections addObject:selection];
    }
    textField.text = [selections componentsJoinedByString:@", "];
}

- (IBAction)showPicker:(id)sender
{
    _previousSelectedString = self->textField.text;
    
    UITableView *tableView = [[UITableView alloc] init];
    tableView.dataSource = self;
    tableView.delegate = self;
    tableView.showsVerticalScrollIndicator = true;
    tableView.autoresizingMask = UIViewAutoresizingFlexibleHeight;
    tableView.separatorColor = [UIColor clearColor];
    
    //If the text field is empty show the place holder
    if (self->textField.text.length == 0)
    {
        if (self->placeholderWhileSelecting) {
            self->textField.placeholder = self->placeholderWhileSelecting;
        }
    }
    
    self->_selection = [[NSMutableArray alloc] init];
    for (NSString *selection in [self->textField.text componentsSeparatedByString:@", "]) {
        [_selection addObject:selection];
    }
    
    UIToolbar* toolbar = [[UIToolbar alloc] init];
    toolbar.barStyle = self->toolbarStyle;
    [toolbar sizeToFit];
    
    //space between buttons
    UIBarButtonItem *flexibleSpace = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace
                                                                                   target:nil
                                                                                   action:nil];
    
    UIBarButtonItem* doneButton = [[UIBarButtonItem alloc]
                                   initWithTitle:self->toolbarDoneButtonText
                                   style:UIBarButtonItemStyleDone
                                   target:self
                                   action:@selector(doneClicked:)];
    
    if (self.shouldDisplayCancelButton) {
        UIBarButtonItem* cancelButton = [[UIBarButtonItem alloc]
                                         initWithTitle:self->toolbarCancelButtonText
                                         style:UIBarButtonItemStylePlain
                                         target:self
                                         action:@selector(cancelClicked:)];
        
        [toolbar setItems:[NSArray arrayWithObjects:cancelButton, flexibleSpace, doneButton, nil]];
    } else {
        [toolbar setItems:[NSArray arrayWithObjects:flexibleSpace, doneButton, nil]];
    }
    
    
    //custom input view
    textField.inputView = tableView;
    textField.inputAccessoryView = toolbar;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return [dataArray count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *simpleTableIdentifier = @"SimpleTableItem";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:simpleTableIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:simpleTableIdentifier];
    }
    
    cell.textLabel.text = [dataArray objectAtIndex:indexPath.row];
    if ([_selection containsObject:cell.textLabel.text]) {
        cell.accessoryType = UITableViewCellAccessoryCheckmark;
        cell.backgroundColor = [UIColor colorWithRed:0.0 green:0.588 blue:0.533 alpha:0.2];
    } else {
        cell.accessoryType = UITableViewCellAccessoryNone;
        cell.backgroundColor = [UIColor colorWithRed:1.0 green:1.0 blue:1.0 alpha:1.0];
    }
    return cell;
}

- (nullable NSIndexPath *)tableView:(UITableView *)tableView willSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell *cell = [tableView cellForRowAtIndexPath:indexPath];
    if ([_selection containsObject:cell.textLabel.text]) {
        cell.accessoryType = UITableViewCellAccessoryNone;
        cell.backgroundColor = [UIColor colorWithRed:1.0 green:1.0 blue:1.0 alpha:1.0];
        [_selection removeObject:cell.textLabel.text];
    } else {
        cell.accessoryType = UITableViewCellAccessoryCheckmark;
        cell.backgroundColor = [UIColor colorWithRed:0.0 green:0.588 blue:0.533 alpha:0.2];
        [_selection addObject:cell.textLabel.text];
    }
    [self updateTextField];
    return nil;
}
@end
